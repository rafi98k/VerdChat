Welcome To VerdChat ! A space where people with common interests (like You and I)
can discuss the topics they like, comfortably .

Experience & Functionality :
- Unified design accross pages .
- Secure Register/Login logic procedure .
- Real-time message exchange .
- The user can Join existing Chatrooms with search by ID functionality, In turn
  he can also create his own Chatroom .

Technical Overview :
- The frontend is about static HTML/CSS pages and Vanilla JS for dynamic content
  generation to reduce framework and template engine overhead and keep the project
  somehow lighweight .
- Token Based Authentication via JSON Web Tokens .
- For the Backend logic / API Endpoints I chose Express.Js for its rather simple
  to understand and maintain syntax without any efficiency trade-offs .
- WebSocket library provides the real-time messaging functionality .
- Prisma was chosen as an ORM for database querying/writing .
- One client socket is used per client to interact with the server socket so
  we reduce the number of socket openings/closings, the socket keeps listening
  for any incoming messages in all rooms, but the frontend logic will render a
  message only if it was sent in currently selected room, otherwise it will be
  loaded with the rest of the chat with an HTTP POST request query .
