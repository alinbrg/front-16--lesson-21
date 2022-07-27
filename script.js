const socket = new WebSocket('ws://ucha.ge:8084');

const myId = Math.random();

let isSocketConnected = false;


socket.addEventListener('open', function (event) {
    isSocketConnected = true;
});

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();

  submitForm();
});

socket.addEventListener('message', function (event) {
  renderMessage(JSON.parse(event.data));
});

const colorSelectorButtons = document.querySelectorAll('.colors button');
for(let button of colorSelectorButtons) {
  button.addEventListener('click', function() {
    changeChatColor(this.style.backgroundColor);
  });
}

document.getElementById('message').addEventListener('focus', function() {
  sendMessage({
    type: "typing",
    author: document.getElementById('author').value,
    senderId: myId
  });
});

document.getElementById('message').addEventListener('blur', function() {
  sendMessage({
    type: "stopped_typing",
    author: document.getElementById('author').value,
    senderId: myId
  });
});

document.getElementById('message').addEventListener('keyup', function(e) {
  if(e.key === 'Enter') {
    submitForm();
  }
});

function submitForm() {
  sendMessage({
    type: "text",
    author: document.getElementById('author').value,
    message: document.getElementById('message').value,
    senderId: myId
  });

  document.getElementById('message').value = '';
}

function changeChatColor(color) {
  sendMessage({
    type: "backgroundColor",
    color: color
  });
}

function renderMessage(message) {
  console.log("Received message: ", message);

  if(message.type === 'text') {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
          <div class="author">${message.author}</div>
          <p>${message.message}</p>
        `;

    if(message.senderId === myId) {
      div.classList.add('my');
    }

    document.getElementById('messages').appendChild(div);
  } else if(message.type === 'backgroundColor') {
    document.querySelector('.wrapper').style.backgroundColor = message.color;
  } else if(message.type === 'typing' && message.senderId != myId) {
    const div = document.createElement('div');
    div.innerHTML = `${message.author} is typing...`;
    document.getElementById('typings').appendChild(div);
    div.id = message.senderId;
  } else if(message.type === 'stopped_typing' && message.senderId != myId) {
    const typingElement = document.getElementById(message.senderId);
    if(typingElement) {
      typingElement.remove();
    }
  }
}

function sendMessage(message) {
  if(isSocketConnected) {
    socket.send(JSON.stringify(message));
  } else {
    console.log("WARNING: We are not connected to the WebSocket yet");
  }
}
