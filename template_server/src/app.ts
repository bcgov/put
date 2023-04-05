// src/app.ts
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import find from 'lodash/find';

// Initialize Express app
const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.get('/', (req: Request, res: Response) => {
    fs.readFile('../template_server/index.html', 'utf8', (err, data) => {
        res.status(200).end(data);
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
      });
  });

app.get("/templates/workflows", (req: Request, res: Response) => {
    fs.readFile('../framework/templates/workflows.json', 'utf8', (err, data) => {
        res.status(200).end(data);
    });
});

app.get("/templates/collections", (req: Request, res: Response) => {
    fs.readFile('../framework/templates/collections.json', 'utf8', (err, data) => {
        res.status(200).end(data);
    });
});

app.get("/templates/categories", (req: Request, res: Response) => {
    fs.readFile('../framework/templates/categories.json', 'utf8', (err, data) => {
        res.status(200).end(data);
    });
});

app.get("/templates/workflows/:id", (req: Request, res: Response) => {
    fs.readFile('../framework/templates/workflows.json', 'utf8', (err, data) => {
        const id = parseInt(req.params.id);
        const workflows = JSON.parse(data); 
        const workflow = workflows.find((workflow: { id: number; }) => workflow.id === id);
        if (workflow) { 
            res.status(200).end(JSON.stringify(workflow));  
        } else {  
            res.status(404).end();
        }     
    });
});

app.get("/templates/collections/:id", (req: Request, res: Response) => {
    fs.readFile('../framework/templates/collections.json', 'utf8', (err, data) => {
        const id = parseInt(req.params.id);
        const collections = JSON.parse(data); 
        const collection = collections.find((collection: { id: number; }) => collection.id === id);
        if (collection) { 
            res.status(200).end(JSON.stringify(collection));
        } else {
            res.status(404).end();
        }
    });
});



//    GET	/templates/workflows/<id>
//    GET	/templates/workflows
//    GET	/templates/collections/<id>
//    GET	/templates/collections
//    GET	/templates/categories

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Template Server is running on port ${PORT}`);
});
