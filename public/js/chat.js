const profile = document.getElementById('profile');
const profilePic = document.getElementById('profilePic');
const dropdown = document.getElementById('dropdown');
let currentUserId = null;
let currentUsername = null ;
let currentRoom = null;
let prevDate = null;

//Connect socket to the server
const socket = new WebSocket('ws://localhost:8000');
socket.onopen = () => {
  console.log ('Connected to server , finally');
};
//recieve real-time messages
socket.addEventListener("message", (msg) => {
    const data = JSON.parse(msg.data);

    const date = new Date(data.createdAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
    });
    const messagesContainer =document.getElementById("messages");
              
    if(date !== prevDate)
        messagesContainer.appendChild(NewDaySeparator(date));
    if(currentRoom){
      if (data.roomId === currentRoom) {
              messagesContainer.appendChild(loadMessage(data));
      }
    }

});


//set placeholder pfp and get user identity  
async function init() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (res.ok) {
    const data = await res.json();
    currentUserId = data.id;
    currentUsername = data.username;
    document.getElementById('profilePic').innerText = currentUsername.charAt(0).toUpperCase();
    document.getElementById('user-dropdown').innerText = currentUsername;

  }
}



profilePic.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!profile.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});




//render client rooms on the sidebar
function renderRoomDiv (room){
  const div = document.createElement("div");
  div.className = "room-item";
  div.dataset.room=  room.name;
  const previewMessage = room.latestMessage
    ? `<b>${room.latestMessage.user.username}: ${room.latestMessage.content}</b>`
    : 'No messages yet';

  div.innerHTML = `
  <div class="room-avatar">${room.name.charAt(0).toUpperCase()}</div>
  <div class="room-info">
  <p class="room-name">${room.name}</p>
  <p class="room-preview">${previewMessage}</p>`;

  div.addEventListener('click', () => {


    document.querySelectorAll('.room-item').forEach(r => r.classList.remove('active'));
    div.classList.add('active');

    currentRoom= room.roomId;

     loadRoom(room);
    //load real-time messages

  });

  return div;
}

//Get the chat area div to render chatrooms
const chatArea = document.getElementById('chatArea');
//Load an actual chat-room
function loadRoom(room){
    chatArea.innerHTML = `
    <div class="chat-header">
      <span class="chat-room-name">#${room.name}</span>
    </div>
    <div class="messages" id="messages"></div>
    <form class="message-form">
      <input type="text" placeholder="Message #${room.name}" class="message-input" />
      <button type="submit" class="send-btn" id="send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  `;
  loadMessages(room.id);

  //send message 
  

  const messageForm = chatArea.querySelector('.message-form');
  messageForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const input = chatArea.querySelector('.message-input');
    const content = input.value.trim();
    if (!content) return;

    try{
      const res= await fetch(`/api/rooms/${room.roomId}/messages`,{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body : JSON.stringify({content}),
      });
      if(!res.ok){
          console.log("failed to send");
          return;
        }
       msg = await res.json();
      const sendingDate =  new Date(msg.createdAt).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
      });
      if( sendingDate!== prevDate){
          document.getElementById('messages').appendChild(NewDaySeparator(sendingDate));
          prevDate = sendingDate;
        }

      socket.send(JSON.stringify(msg));
      document.getElementById('messages').appendChild(loadMessage(msg));
      input.value = '';
    }
    catch(err){
      console.log(err);
    }

  });
}

//this renders a single message , we will use it later to render all chat
function loadMessage(msg) {
  const div = document.createElement("div");
  const isOwn = msg.userId === currentUserId;
  div.className = `message-group ${isOwn ? 'sent' : 'received'}`;

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
    <div class="message-meta">
      ${!isOwn ? `<span class="message-sender">${msg.user.username}</span>` : ''}
      <span class="message-time">${time}</span>
    </div>
    <div class="message-bubble">${msg.content}</div>


  `;
  return div;
}
function NewDaySeparator(date) {
  const div = document.createElement("div");
  div.className = "date-separator";

  div.innerHTML = `
      <span>${date}</span>
    `;
  return div;
}


//Fetch the api for all messages for a room and load them for user
async function loadMessages(roomId) {
  const messagesContainer = document.getElementById("messages");
  const target = `/api/rooms/${roomId}/messages`;
  try{
    const res = await fetch(target);
    if(!res.ok)
      throw new Error("Error loading messages");

    const data = await res.json();
    const fragment = document.createDocumentFragment();
    /*message sending form sets prevDate to current date whenever submitted*/
    /*which results in comparison below returning true leading to today's messages'*/
    /*not being distinguished from yesterday's (only when this function is executed)*/
    //so it must be reset to get clean delimiters . 
    prevDate = null;
    data.messages.forEach((msg) =>{
      const date = new Date(msg.createdAt).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
      });
      
      //Add separator when at a new day .
      if(date!==prevDate){
        fragment.appendChild(NewDaySeparator(date));
        prevDate = date;
      }

      fragment.appendChild(loadMessage(msg));
    });
    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  catch(err){
    console.log(err);
  }
}


//Get all the rooms and load them for the user
async function loadRooms(){
  try {
    const container = document.getElementById('roomList');
    const res = await fetch(`/api/rooms/get/${currentUserId}`);
    if(!res.ok) console.log("Could NOT get rooms data");

    const data = await res.json();
    data.rooms.forEach((room) => {
      container.appendChild(renderRoomDiv(room));
    });
  }
  catch(err){
    console.log(err);
  }
}

/*----------------Create room form---------------------------------------------------*/
const CRoomModalOverlay = document.getElementById('CRoomModalOverlay');
const createRoomBtn = document.getElementById("createRoom");
const modalClose = document.getElementById('modalClose');
const createRoomForm = document.getElementById('createRoomForm');

createRoomBtn.addEventListener('click',(e)=>{
  CRoomModalOverlay.classList.add('open');
});

modalClose.addEventListener('click',(e)=>{
  CRoomModalOverlay.classList.remove('open');
});
CRoomModalOverlay.addEventListener('click', (e) => {
  if (e.target === CRoomModalOverlay) CRoomModalOverlay.classList.remove('open');
});

createRoomForm.addEventListener('submit',async(e)=>{
    const roomName =  document.getElementById('roomName').value.trim();
    if (!roomName) return;
    try{
    const res = await fetch('api/rooms/create',{
      method :"POST",
      headers: { 'Content-Type': 'application/json' },
      credentials : "include",
      body : JSON.stringify({roomName}),
    });
    if(!res.ok){
        console.log('failed to create room');
      }
    const room = await res.json();
    document.getElementById('roomList').appendChild(renderRoomDiv(room));
    CRoomModalOverlay.classList.remove('open');
    createRoomForm.reset();
  } catch(err){
    console.log(err);
  }


});

/*Find room logic*/
const searchBtn = document.getElementById("searchBtn");
const sidebarBrand = document.querySelector('.sidebar-header .brand');
const searchOverlay = document.getElementById('searchOverlay');

searchBtn.addEventListener('click', () => {
  sidebarBrand.style.display = 'none';
  searchBtn.style.display = 'none';
  searchOverlay.classList.add('active');
  document.getElementById('searchInput').focus();
});

document.getElementById('searchCancel').addEventListener('click', () => {
  sidebarBrand.style.display = 'flex';
  searchBtn.style.display = 'inline-flex';
  searchOverlay.classList.remove('active');
  document.getElementById('searchInput').value = '';
});

searchRooms = async(roomName)=>{
    if (!roomName) {
    await loadRooms(); // restore original list
    return;}
  const res = await fetch(`/api/rooms/search?q=${roomName}`, { credentials: 'include' });
  if (!res.ok) return;
  const rooms = await res.json();
  const roomListDiv = document.getElementById("roomList");
  roomListDiv.replaceChildren(); // Safely clears all child nodes and text
  rooms.forEach(r => roomListDiv.appendChild(renderRoomDiv(r)));

  }

//Debounce search , at every brief pause send a query to the backend
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchRooms(e.target.value.trim());
  }, 500);
});


/*findRoomForm.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const roomId = document.getElementById('roomId').value;
  try{
    //search for the room through the API
    const res = await fetch(`api/rooms/${roomId}/find`);
    const room = await res.json();
    //hide the form
    document.getElementById('findRoomForm').style.display = 'none';

    const resultDiv= document.getElementById('searchResult');

  }
  catch(err){
    console.log(err);
  }
})*/


async function start() {
    await init();
    await loadRooms();

    }


start();

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  } catch (err) {
    console.log(err);
  }
});