const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.port || 3000;

const welcomeMessage = {
  id: 0,
  from: "Bart",
  text: "Welcome to CYF chat system!",
};

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
const messages = [welcomeMessage];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Gets all the messages
app.get("/messages", (req, res) => res.json(messages));

app.get("/messages/search", (req, res) => {
  const search = req.query.text;
  const result = messages.filter((message) =>
    message.text.toLowerCase().includes(search)
  );
  res.send(result);
});

app.get("/messages/latest", (req, res) => {
  const latest = [];
  for (let i = 0; i < 10; i++) {
    if (messages[i]) {
      latest.push(messages[i]);
    }
  }
  res.send(latest);
});

const getIncrementingId = () => {
  const lastMessage = messages[messages.length - 1];
  return lastMessage ? lastMessage.id + 1 : 0;
};

// Posts a message from the body
app.post("/messages", (req, res) => {
  const newMessage = {
    id: getIncrementingId(),
    from: req.body.from,
    text: req.body.text,
  };

  // Will only post if the message and name are not empty
  if (!newMessage.from || !newMessage.text) {
    res.status(400).json({ msg: "Please include a name and message" });
  } else {
    messages.push(newMessage); // Pushes the new message to the messages array
    res.json(messages);
  }
});

// Helper function for finding a message
const findMessage = (id) =>
  messages.find((message) => message.id === Number(id));

// Gets a specific message by id
app.get("/messages/:id", (req, res) => {
  if (findMessage(req.params.id)) {
    res.send(findMessage(req.params.id)); // Will show a particular message
  } else {
    res.status(400).json({ msg: `No message with id: ${req.params.id}` });
  }
});

app.delete("/messages/:id", (req, res) => {
  const index = messages.indexOf(findMessage(req.params.id)); // Check the index of the message to be deleted
  if (findMessage(req.params.id)) {
    messages.splice(index, 1);
  } else {
    res
      .status(400)
      .json({ msg: `Could not delete. No message with id: ${req.params.id}` });
  }
  res.send(messages);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
