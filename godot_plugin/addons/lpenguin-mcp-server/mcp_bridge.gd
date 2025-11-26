@tool
extends EditorPlugin

var tcp_server: TCPServer
var server_port: int = 8085
var active_connections: Array[StreamPeerTCP] = []

var path_to_uid: Dictionary[String, String] = {}

func _enter_tree() -> void:
	tcp_server = TCPServer.new()
	var err = tcp_server.listen(server_port)
	if err == OK:
		print("[MCP Bridge] TCP Server started on port %d" % server_port)
	else:
		push_error("[MCP Bridge] Failed to start TCP Server on port %d: %s" % [server_port, error_string(err)])

func _exit_tree() -> void:
	# Clean up all active connections
	for connection in active_connections:
		if connection.get_status() != StreamPeerTCP.STATUS_NONE:
			connection.disconnect_from_host()
	active_connections.clear()
	
	# Stop the server
	if tcp_server:
		tcp_server.stop()
		print("[MCP Bridge] TCP Server stopped")

func _process(_delta: float) -> void:
	if not tcp_server or not tcp_server.is_listening():
		return
	
	# Accept new connections
	if tcp_server.is_connection_available():
		var connection = tcp_server.take_connection()
		active_connections.append(connection)
		print("[MCP Bridge] New client connected")
	
	# Process existing connections
	var i = 0
	while i < active_connections.size():
		var connection = active_connections[i]
		var status = connection.get_status()
		
		if status == StreamPeerTCP.STATUS_NONE or status == StreamPeerTCP.STATUS_ERROR:
			# Connection closed or errored
			active_connections.remove_at(i)
			continue
		
		if status == StreamPeerTCP.STATUS_CONNECTED:
			# Check if data is available
			var available = connection.get_available_bytes()
			if available > 0:
				var data = connection.get_string(available)
				_handle_request(connection, data)
		
		i += 1

func _handle_request(connection: StreamPeerTCP, data: String) -> void:
	# Parse JSON request
	var json = JSON.new()
	var parse_result = json.parse(data.strip_edges())
	
	if parse_result != OK:
		_send_error(connection, "Invalid JSON")
		return
	
	var request = json.data
	if typeof(request) != TYPE_DICTIONARY:
		_send_error(connection, "Request must be a JSON object")
		return
	
	if not request.has("command"):
		_send_error(connection, "Missing 'command' field")
		return
	
	var command = request["command"]
	var args = request["args"] if request.has("args") else {}

	if typeof(args) != TYPE_DICTIONARY:
		_send_error(connection, "'args' field must be a JSON object")
		return
	
	if command == "get_path_uid":
		_handle_get_path_uid(connection, args)
	elif command == "rescan_filesystem":
		_handle_rescan_filesystem(connection, args)
	else:
		_send_error(connection, "Unknown command: %s" % command)

func _handle_get_path_uid(connection: StreamPeerTCP, args: Dictionary) -> void:
	var path = args.get("path")
	if path == null or typeof(path) != TYPE_STRING:
		_send_error(connection, "Missing or invalid 'path' argument")
		return
	
	var uid: String
	# Check if we already have a UID for this path
	if path_to_uid.has(path):
		uid = path_to_uid[path]
		print("[MCP Bridge] Found cached UID for path %s: %s" % [path, uid])
	else:
		var cached_uid = ResourceUID.path_to_uid(path)
		if cached_uid != path: # path is valid and has a UID
			uid = cached_uid
			print("[MCP Bridge] Found existing UID for path %s: %s" % [path, uid])
		else:
			# Generate a new UID
			var new_id = ResourceUID.create_id()
			uid = ResourceUID.id_to_text(new_id)
			ResourceUID.add_id(new_id, path)
			print("[MCP Bridge] Generated new UID for path %s: %s" % [path, uid])
		# Cache the UID
		path_to_uid[path] = uid

	var response = {
		"status": "success",
		"uid": uid
	}
	
	_send_response(connection, response)

func _handle_rescan_filesystem(connection: StreamPeerTCP, args: Dictionary) -> void:
	EditorInterface.get_resource_filesystem().scan()
	print("[MCP Bridge] Filesystem rescan triggered")
	
	var response = {
		"status": "success",
		"message": "Filesystem rescan initiated"
	}
	
	_send_response(connection, response)

func _send_response(connection: StreamPeerTCP, response: Dictionary) -> void:
	var json_string = JSON.stringify(response)
	connection.put_data((json_string + "\n").to_utf8_buffer())

func _send_error(connection: StreamPeerTCP, message: String) -> void:
	var response = {
		"status": "error",
		"message": message
	}
	_send_response(connection, response)
