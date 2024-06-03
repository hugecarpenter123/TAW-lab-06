import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";

class UserController implements Controller {
   public path = '/api/user';
   public router = Router();
   private userService = new UserService();
   private passwordService = new PasswordService();
   private tokenService = new TokenService();

   constructor() {
       this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.post(`${this.path}/create`, this.createNewOrUpdate);
       this.router.post(`${this.path}/auth`, this.authenticate);
       this.router.delete(`${this.path}/logout/:userId`, auth,  this.removeHashSession);

       this.router.post(`${this.path}/reset-password/:userId`, auth, this.resetPassword);
   }

   private authenticate = async (request: Request, response: Response, next: NextFunction) => {
    const {login, password} = request.body;
    try {
        const user = await this.userService.getByEmailOrName(login);
        if (!user) {
            return response.status(401).json({ error: 'Unauthorized' });
        }
        
        if (user && user.id) {
            await this.passwordService.authorize(user.id, await this.passwordService.hashPassword(password));
            const token = await this.tokenService.create(user);
            return response.status(200).json(this.tokenService.getToken(token));
        } else {
            return response.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error: any) {
        console.error(`Validation Error: ${error.message}`);
        return response.status(401).json({ error: 'Unauthorized' });
    }
};

   private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
    const userData = request.body;
    try {
        const user = await this.userService.createNewOrUpdate(userData);
        if (user && user._id) {
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password);
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            return response.status(200).json(user);
        } else {
            return response.status(400).json({ error: 'Bad request', value: 'User data is invalid' });
        }
    } catch (error: any) {
        console.error(`Validation Error: ${error.message}`);
        return response.status(400).json({ error: 'Bad request', value: error.message });
    }
};

 private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
    const { userId } = request.params;
    const { newPassword } = request.body;

    try {
        const hashedPassword = await this.passwordService.hashPassword(newPassword);
        
        await this.passwordService.createOrUpdate({
            userId,
            password: hashedPassword
        });

        response.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(`Error resetting password: ${error.message}`);
        response.status(500).json({ error: 'Internal server error' });
    }
};

 private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
    const {userId} = request.params
 
    try {
        const result = await this.tokenService.remove(userId);
        response.status(200).send(result);
    } catch (error) {
        console.error(`Validation Error: ${error.message}`);
        response.status(401).json({error: 'Unauthorized'});
    }
 };
 



}

export default UserController;