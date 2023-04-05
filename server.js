const express = require("express")
const next = require("next")
const path = require("path")
if (process.env.NODE_ENV === "development") {
  require("dotenv").config({
    path: path.resolve(__dirname, `./env/${process.env.ENV_FILE}`),
  })
}

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// const Dog = require("./models/Dog")

function createServer() {
  const server = express()
  //   server.get("/api/dog/:breed", async (req, res) => {
  //     const { breed } = req.params
  //     try {
  //       const dogData = await Dog.query("breed").eq(breed).exec()

  //       res.send({ s: "success", d: dogData })
  //     } catch (e) {
  //       res.status(500).send({ s: "error", m: e.message })
  //     }
  //   })

  //   server.get("/api/mock-dog-create/", async (req, res) => {
  //     try {
  //       const dogs = [
  //         {
  //           name: "Ollie",
  //           breed: "terrier",
  //         },
  //         {
  //           name: "Maxi",
  //           breed: "labrador",
  //         },
  //         {
  //           name: "Rio",
  //           breed: "border_collie",
  //         },
  //       ]

  //       await Dog.batchPut(dogs)

  //       res.send({ s: "success", m: "Dogs created successfully", d: dogs })
  //     } catch (e) {
  //       res.status(500).send({ s: "error", m: e.message })
  //     }
  //   })
  server.post("/api/graphql", (req, res) => handle(req, res))
  server.get("*", (req, res) => handle(req, res))

  return server
}

if (dev) {
  app.prepare().then(() => {
    const server = createServer()

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
} else {
  const server = createServer()

  module.exports = server
}
