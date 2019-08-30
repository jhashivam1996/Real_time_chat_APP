const mongo = require("mongodb").MongoClient;
const client = require("socket.io").listen(4000).sockets;

mongo.connect(
  "mongodb://sawan123:sawan123@cluster0-shard-00-00-9gjiz.mongodb.net:27017,cluster0-shard-00-01-9gjiz.mongodb.net:27017,cluster0-shard-00-02-9gjiz.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true",
  function(err, db) {
    if (!err) console.log("\nConnected to Mongodb cloud ATLAS.");
    else console.log(err);

    //connect to socket.io
    client.on("connection", function(socket) {
      let chat = db.collection("chats");
      console.log(socket.id);

      // function to send status to user
      sendStatus = function(s) {
        socket.emit("status", s);
      };

      //get data from collection chats
      chat
        .find()
        .limit(100)
        .sort({ _id: 1 })
        .toArray(function(err, res) {
          if (err) {
            throw err;
          }

          //emit the message
          socket.emit("output", res);
        });

      //handle input events
      socket.on("input", function(data) {
        let name = data.name;
        let message = data.message;
        //check for name and message

        if (name == "" || message == "") {
          sendStatus("please enter name and message");
        } else {
          //insert message into database

          chat.insert({ name: name, message: message }, function() {
            socket.emit("output", [data]);

            //send status
            sendStatus({
              message: "message sent",
              clear: true
            });
          });
        }
      });
      //handle clear
      socket.on("clear", function() {
        //remove all chats
        chat.remove({}, function() {
          socke.emit("cleared");
        });
      });
    });
  }
);
