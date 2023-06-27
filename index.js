const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
// middleware
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.pr3rbd0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const projectCollection = client.db("souravPortfolio").collection("Projects");

    app.post("/projects", async (req,res) => {
      const newProjects = req.body;
      const result = await projectCollection.insertOne(newProjects);
      res.json(result);
    })
    

    app.get("/projects", async (req, res) => {
      const queryValue = req?.query?.tabValue;
    
      let query = {};
      if (queryValue === 'frontend') {
        query = {
          $and: [
            { skills: { $not: { $regex: "express", $options: "i" } } },
            { skills: { $regex: "^(react|nextjs)$", $options: "i" } }
          ]
        };
      } else if (queryValue === "fullstack") {
        query = {
          $and: [
            { skills: { $regex: "react", $options: "i" } },
            { skills: { $regex: "express", $options: "i" } }
          ]
        };
      } else if (queryValue === 'wordpress') {
        query = { skills: { $regex: "wordpress", $options: "i" } };
      } else if (queryValue === 'nextjs') {
        query = { skills: { $regex: "nextjs", $options: "i" } };
      }
    
      const result = await projectCollection.find(query).toArray();
      res.send(result);
    });
    
    app.get("/projects/:id", async (req,res) => {
      const projectId = req.params.id;
      console.log(projectId);
      const filter = {_id: new ObjectId(projectId)};
      const result = await projectCollection.findOne(filter);
      res.send(result)
    })

    app.post("/projects/:id", async (req,res) => {
      const projectId = req.params.id;
      const updateProject = req.body;
      console.log(updateProject);
      const options = { upsert: true };
      const filter = {_id: new ObjectId(projectId)};
      const updateDoc = {
        $set: {
          title: updateProject.title,
          liveLink: updateProject.liveLink,
          clientLink: updateProject.clientLink,
          serverLink: updateProject.serverLink,
          skills: updateProject.skills,
          description: updateProject.description,
          projectSS: updateProject.projectSS,
        },
      };
      const result = await projectCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })


    app.delete("/projects/:id", async (req,res) => {
      const projectId = req.params.id;
      const filter = {_id: new ObjectId(projectId)};
      const result = await projectCollection.deleteOne(filter);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get("/",(req,res) => {
    res.send("Hello World")
})

app.listen(port,(req,res) => {
    console.log(`sourav basak portfolio running this port ${port}`);
})