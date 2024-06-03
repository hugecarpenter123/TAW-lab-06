import { Request, Response, NextFunction, Router } from 'express';
import Controller from '../interfaces/controller.interface';
import { checkPostCount } from "../middlewares/checkPostCount.middleware";
import DataService from '../modules/services/data.service';
import Joi from 'joi';

let testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

class PostController implements Controller {
    public path = '/api/post';
    public router = Router();
    public dataService = new DataService;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.addPost);
        this.router.post(`${this.path}/:num`, checkPostCount, this.getNumPosts);

        this.router.get(`${this.path}/:id`, this.getPostById);
        this.router.get(`${this.path}s`, this.getAllPosts);
        
        this.router.delete(`${this.path}:id`, this.deletePostById);
        this.router.delete(`${this.path}s`, this.deleteAllPost);
    }

    // POST
    private addPost = async (request: Request, response: Response, next: NextFunction) => {
        const {title, text, image} = request.body;

        
        const schema = Joi.object({
            title: Joi.string().required(),
            text: Joi.string().required(),
            image: Joi.string().uri().required()
        });
        
        try {
            const validatedDate = await schema.validateAsync({title, text, image});
            await this.dataService.addPost(validatedDate);
            response.status(200).json(validatedDate);
        } catch (error) {
                console.error(`Validation Error: ${error.message}`);
                response.status(400).json({error: 'Invalid input data.'});
        }
    }

    private getNumPosts = async (request: Request, response: Response, next: NextFunction) => {
        const { num } = request.params;
        const numData = await this.dataService.getNumPosts(num);
        response.status(200).json(numData);
    };    

    // GET
    private getPostById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const post = await this.dataService.getPostById({ _id: id });
        response.status(200).json(post);
    }
    
    private getAllPosts = async (request: Request, response: Response, next: NextFunction) => {
        const posts = await this.dataService.getAllPosts();
        response.status(200).json(posts);
    };

    // DELETE
    private deletePostById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        await this.dataService.deletePostById({_id: id});
        response.status(200);
    };

    private deleteAllPost = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        await this.dataService.deleteAllPosts();
        response.status(200);
    };
    
}

export default PostController;