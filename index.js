const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3001;

const uri = "mongodb+srv://deniz:deniz@cluster0.bybzfnv.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDB() {
  try {
    await client.connect();
    console.log("MongoDB'ye başarıyla bağlandı!");
  } catch (error) {
    console.error("MongoDB bağlantısı başarısız:", error);
  }
}

async function insertBlogData(name, content, author) {
  const db = client.db("blogDB");
  const blogsCollection = db.collection("blogs");

  const result = await blogsCollection.insertOne({
    name: name,
    blog: content,
    author: author,
  });

  console.log("Veri başarıyla eklendi:", result.insertedId);
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const blogs = await client.db("blogDB").collection("blogs").find().toArray();
  res.render("index", { blogs: blogs });
});

app.get("/author/:authorName", async (req, res) => {
  const authorName = req.params.authorName.toLowerCase();
  const blogs = await client
    .db("blogDB")
    .collection("blogs")
    .find({ author: authorName })
    .toArray();
  res.render("author", { author: authorName, blogs: blogs });
});

app.post("/addBlog", async (req, res) => {
  const name = req.body.name;
  const content = req.body.blog;
  const author = req.body.author;

  await insertBlogData(name, content, author);

  res.redirect(`/author/${author.toLowerCase()}`);
});

connectToDB().then(() => {
  app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
  });
});
