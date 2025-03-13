import threading
import socketio
import eventlet


sio = socketio.Client()
server_sio = socketio.Server()
app = socketio.WSGIApp(server_sio)

connected = threading.Event()

@sio.event
def connect():
  print('Connection established with Node.js server')
  connected.set() 

@sio.event
def message(data):
  print('\nMessage from Node.js server:', data)
  print('Enter a message: ', end='', flush=True)

@sio.event
def disconnect():
  print('Disconnected from Node.js server')
  connected.clear()

@server_sio.event
def connect(sid, environ):
  print(f'Python server connected to a client: {sid}')

@server_sio.event
def message(sid, data):
  print('\nMessage from Node.js:', data)

    # Avoid infinite loop by not re-emitting the message received from Node.js
  if data != "forwarded":
    sio.emit('message', "forwarded")

def send_message():
  while True:
    message = input('Enter a message: ')
    connected.wait()
    sio.emit('message', message)

if __name__=='__main__':
  threading.Thread(target=send_message, daemon=True).start()

  sio.connect('http://localhost:3000')

  eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
