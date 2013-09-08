//Helper functions

function sendMessage(){
  var message = $("#mensaje").val();
  socket.emit('message-sent', { 'message': message });
  d = new Date();
  $("#message-list").append(
      "<li class='list-group-item alert-info' style='margin-bottom:10px;'>" +
        "<span class='badge'> " + 
          d.toLocaleTimeString() + " <span class='glyphicon glyphicon-time'></span>" + 
        "</span> " + 
        "<strong>Tú:</strong> " + message + 
      "</li>");
}
  
function sendNick(event){
  event.preventDefault();
  var nick = $("#nickname").val();
  console.log("entra");
  if(nick.length == 0){
      $("#flashes").html("<div class='alert alert-danger'>El nick no puede ser vacío</div>")

    return false;
  }else if(nick.search(" ") != -1){
      $("#flashes").html("<div class='alert alert-danger'>El nick no puede contener espacios</div>")  

      return false;
  }else{
    socket.emit("set-nickname", { 'nick': nick});
  }
  
}

function clearFlashes(){
  $("#flashes").empty();
}


//Event bindings
$(document).ready(function(){
  $("#enviar").on("click",sendMessage);
  $("#mensaje").keypress(function(event){
    if(event.keyCode == 13){
      sendMessage();
    }
  });
  
  $("#limpiar-chat").on("click", function(){
    $("#message-list").empty();
  });

  $("#set-nick").on("click", sendNick);

  $("#desconectar").on("click", function(){
    socket.disconnect();
    $("#chat-window").hide();
    $("#nickname-window").show();
    socket.socket.connect();
  });

})


//Sockets transmissions
var socket = io.connect('http://localhost');

socket.on('totalUsers', function(data){
  $("#count").html(" " + data.totalUsers + " usuarios conectados");
});

socket.on('nick-exists', function(data){
  $("#flashes").html("<div class='alert alert-danger'>" + data.msg + "</div>")
});

socket.on('nick-saved', function(data){
  //$("#flashes").html("<div class='alert alert-success'>Welcome " + data.nick + "</div>");
  clearFlashes();
  $("#chat-window").show();
  $("#nickname-window").hide();
});

socket.on('message-broadcast', function(data){
  $("#message-list").append(
      "<li class='list-group-item alert-success' style='margin-bottom:10px;'>" +
        "<span class='badge'> " + 
          data.time + " <span class='glyphicon glyphicon-time'></span>" + 
        "</span> " + 
        "<strong>" + data.nick + ": </strong>" + data.message + 
      "</li>");
});

socket.on("userList", function(data){
  $("#listado-usuarios").empty();
  _.each(data.userList, function(nick){
    $("#listado-usuarios").append("<li class='list-group-item'>" + nick + "</li>");
  });
})