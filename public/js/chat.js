const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#messages')

//Templets
const messageTemplate = document.querySelector('#message-templete').innerHTML
const locationMessageTemplete = document.querySelector('#location-message-templete').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML
//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new messange
    const $newMessage = $message.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $message.offsetHeight

    //Height of messages container
    const containerHeight = $message.scrollHeight

    //How far i have scrolled?
    const scrollOffset =  $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('message', (message) => {
     console.log(message)
     const html = Mustache.render(messageTemplate, {
        username: message.username,
         message: message.text,
         createdAt: moment(message.createdAt).format('h:m a')
     })
     $message.insertAdjacentHTML('beforeend', html)
     autoscroll()
 })

 socket.on('locationMessage', (urlmessage) => {
    console.log(urlmessage)
    const html = Mustache.render(locationMessageTemplete, {
        username: urlmessage.username,
        url: urlmessage.url,
        createdAt: moment(urlmessage.createdAt).format('h:m a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplete, {room, users})
    document.querySelector('#sidebar').innerHTML = html
})

 $messageForm.addEventListener('submit', (e)=> {
     e.preventDefault()
     $messageFormButton.setAttribute('disabled', 'disabled')

     const message = e.target.elements.message.value
     socket.emit('sendMessage', message, (error) => {
         $messageFormButton.removeAttribute('disabled')
         $messageFormInput.value=''
         $messageFormInput.focus()
         if (error) {
             return console.log(error)
         }
         console.log('Message delivered!')
     })
 })

 $sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () =>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shered!')
        })
    })
 })

 socket.emit('join', {username, room}, (error) => {
     if (error){
         alert(error)
         location.href = '/'
     }
 })