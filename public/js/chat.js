const profile = document.getElementById('profile');
const profilePic = document.getElementById('profilePic');
const dropdown = document.getElementById('dropdown');

let currentUserId ;
let currentUsername ;
let prevDate = null;
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

/*----------------Create room form---------------------------------------------------*/
const modalOverlay = document.getElementById('modalOverlay');
const createRoomBtn = document.getElementById("createRoom");
const modalClose = document.getElementById('modalClose');
const createRoomForm = document.getElementById('createRoomForm');

createRoomBtn.addEventListener('click',(e)=>{
  modalOverlay.classList.add('open');
});

modalClose.addEventListener('click',(e)=>{
  modalOverlay.classList.remove('open');
});
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('open');
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
    modalOverlay.classList.remove('open');
    createRoomForm.reset();
  } catch(err){
    console.log(err);
  }


});

//Get the chat area div to render chatrooms
const chatArea = document.getElementById('chatArea');

//render client rooms on the sidebar
function renderRoomDiv (room){
    const div = document.createElement("div");
    div.className = "room-item";
    div.dataset.room=  room.room.name;
    div.innerHTML = `
          <div class="room-avatar">${room.room.name.charAt(0).toUpperCase()}</div>
          <div class="room-info">
          <p class="room-name">${room.room.name}</p>
          <p class="room-preview">No messages yet</p>`;

    div.addEventListener('click', () => {
    document.querySelectorAll('.room-item').forEach(r => r.classList.remove('active'));
    div.classList.add('active');
    loadRoom(room);
  });

    return div;
}
//Load an actual chat-room
function loadRoom(room){
    chatArea.innerHTML = `
    <div class="chat-header">
      <span class="chat-room-name">#${room.room.name}</span>
    </div>
    <div class="messages" id="messages"></div>
    <form class="message-form">
      <input type="text" placeholder="Message #${room.room.name}" class="message-input" />
      <button type="submit" class="send-btn" id="send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  `;
  loadMessages(room.roomId);

  //send message 
  

  const form = chatArea.querySelector('.message-form');
  form.addEventListener('submit',async (e)=>{
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
      const msg = await res.json();
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
    data.messages.forEach((msg,i) =>{
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