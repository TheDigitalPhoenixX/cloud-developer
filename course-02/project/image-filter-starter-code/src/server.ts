import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: Request, res: Response) => {
    const imageURL: string = req.query.image_url;

    if (!imageURL) {
      return res.status(400).send({ message: "image_url is required " });
    }

    try {
      new URL(imageURL);
    } catch (error) {
      return res.status(400).send({ message: "image_url is malformed" });
    }

    if (imageURL.match(/\.(jpg|jpeg|png|bmp|tiff)$/) === null) {
      return res.status(422).send({
        message:
          "image_url is not a URL for an image of type ['jpg', 'jpeg', 'png', 'bmp', 'tiff']",
      });
    }

    try {
      const filteredImagePath = await filterImageFromURL(imageURL);
      res.sendFile(filteredImagePath, (error: Error) => {
        deleteLocalFiles([filteredImagePath]);
      });
    } catch (error) {
      res.status(422).send({ message: "Could not process request" });
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
