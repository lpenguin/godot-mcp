@tool
extends EditorPlugin

var tcp_server: TCPServer
var server_port: int = 8085
var active_connections: Array[StreamPeerTCP] = []

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
	
	if command == "get_new_uid":
		_handle_get_new_uid(connection)
	else:
		_send_error(connection, "Unknown command: %s" % command)

func _handle_get_new_uid(connection: StreamPeerTCP) -> void:
	# Generate a new ResourceUID
	var new_id = ResourceUID.create_id()
	var uid_string = ResourceUID.id_to_text(new_id)
	
	var response = {
		"status": "success",
		"uid": uid_string
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
