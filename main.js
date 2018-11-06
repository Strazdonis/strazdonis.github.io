if(window.localStorage.getItem("vardas")) {
	function removeA(arr) {
		var what, a = arguments, L = a.length, ax;
		while (L > 1 && arr.length) {
			what = a[--L];
			while ((ax= arr.indexOf(what)) !== -1) {
				arr.splice(ax, 1);
			}
		}
		return arr;
	}
	document.getElementById("logged_in").style.display="block";
	listas =  document.querySelector("#rasytojas_atsirado b");
	const INSTANCE_LOCATOR = 'v1:us1:d6ef0a21-b488-4a71-a59d-65431f8409f2'
	const TOKEN_PROVIDER_URL = 'https://us1.pusherplatform.io/services/chatkit_token_provider/v1/d6ef0a21-b488-4a71-a59d-65431f8409f2/token?instance_locator=v1:us1:d6ef0a21-b488-4a71-a59d-65431f8409f2'
	const USER_ID = window.localStorage.getItem("vardas")
	let rasytojai = []
	let currentUser
	let room
	const tokenProvider = new Chatkit.TokenProvider({
	  url: TOKEN_PROVIDER_URL
	})

	chatManager = new Chatkit.ChatManager({
	  instanceLocator: INSTANCE_LOCATOR,
	  tokenProvider: tokenProvider,
	  userId: USER_ID
	})
	chatManager.connect()
	  .then(cUser => {
		currentUser = cUser
		const roomToSubscribeTo = currentUser.rooms[0]

		if (roomToSubscribeTo) {
		  room = roomToSubscribeTo
		  console.log('Going to subscribe to', roomToSubscribeTo)
		  currentUser.subscribeToRoom({
			roomId: roomToSubscribeTo.id,
			hooks: {
			  onUserStartedTyping: user => {
				rasytojai.push(user);
				rasytojai.forEach(function(raso) {
				  console.log(raso.name + "kazka raso");
				  listas.innerText+=raso.name;
				});
				document.getElementById("rasytojas_atsirado").style.display = "block";
			  },
			  onUserStoppedTyping: user => {
				listas.innerText="";
				removeA(rasytojai, user);
				if(rasytojai.length < 1) {
					document.getElementById("rasytojas_atsirado").style.display = "none";
				}
				rasytojai.forEach(function(raso) {
				  listas.innerText+=raso.name;
				});
			  },
			  onNewMessage: message => {
				console.log('new message:', message)
				const messagesList = document.getElementById('messages')
				const messageItem = document.createElement('li')
				messageItem.className = 'message'
				messagesList.append(messageItem)
				const textDiv = document.createElement('div')
				textDiv.innerHTML = `${message.sender.name}: ${message.text}`
				messageItem.appendChild(textDiv)

				if (message.attachment) {
				  let attachment
				  switch (message.attachment.type) {
					case 'image':
					  attachment = document.createElement('img')
					  break
					case 'video':
					  attachment = document.createElement('video')
					  attachment.controls = 'controls'
					  break
					case 'audio':
					  attachment = document.createElement('audio')
					  attachment.controls = 'controls'
					  break
					default:
					  break
				  }

				  attachment.className += ' attachment'
				  attachment.width = '400'

				  if (message.attachment.fetchRequired) {
					currentUser.fetchAttachment({ url: message.attachment.link })
					  .then(fetchedAttachment => {
						attachment.src = fetchedAttachment.link
						messageItem.appendChild(attachment)
					  })
					  .catch(error => {
						console.log('Error', error)
					  })
				  } else {
					attachment.src = message.attachment.link
					messageItem.appendChild(attachment)
				  }
				}
			  }
			}
		  })
		} else {
		  console.log('No room to subscribe to')
		}
		console.log('Successful connection', currentUser)
	  })
	  .catch(err => {
		console.log('Error on connection: ', err)
	  })
	document.addEventListener("DOMContentLoaded", function() {
		document.getElementById("text-input").addEventListener('keypress', ev=> {
			currentUser.isTypingIn({ roomId: 19372887 })
				.then(() => {
					console.log('Success!')
				})
				.catch(err => {
				console.log(`Error sending typing indicator: ${err}`)
			})
		});
			document.getElementById('form').addEventListener('submit', ev => {
		ev.preventDefault();
	  const fileInput = document.querySelector('input[name=testfile]')
	  const textInput = document.getElementById('text-input')
	  currentUser.sendMessage({
		text: textInput.value,
		roomId: room.id,
		// attachment: {
		//   link: 'https://assets.zeit.co/image/upload/front/api/deployment-state.png',
		//   type: 'image',
		// },
		attachment: fileInput.value
		  ? {
			file: fileInput.files[0],
			// Split on slashes, remove whitespace
			name: fileInput.value.split(/(\\|\/)/g).pop().replace(/\s+/g, ''),
		  }
		  : undefined,
	  })
		.then(messageId => {
		  console.log('Success!', messageId)
		  fileInput.value = ''
		  textInput.value = ''
		})
		.catch(error => {
		  console.log('Error', error)
		})
	})
	document.querySelector('.choose-file').addEventListener('click', () => {
	  document.querySelector('input[name=testfile]').click()
	})
	});

} else {
	el = document.getElementById("login");
	el.style.display="block";
	document.getElementById('logas').addEventListener('submit', ev => {
		ev.preventDefault();
		window.localStorage.setItem("vardas", document.getElementById("vardas_input").value);
		location.reload();
	});
}