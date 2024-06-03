import {IData, Query} from "../models/data.model";
import PostModel from '../schemas/data.schema';

class DataService {

    // POST
    public async addPost(postParams: IData) {
        try {
            const dataModel = new PostModel(postParams);
            await dataModel.save();
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async getNumPosts(numStr: string) {
        try {
            const num = parseInt(numStr);
            const result = await PostModel.find().limit(num);
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania danych: ', error);
            throw new Error('Wystąpił błąd podczas pobierania danych');
        }
    }

    // GET
    public async getPostById(query: Query<number | string | boolean>) {
        try {
            const result = await PostModel.find(query, { __v: 0, _id: 0 });
            return result;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async getAllPosts() {
        try {
            const result = await PostModel.find();
            return result;
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania danych: ', error);
            throw new Error('Wystąpił błąd podczas pobierania danych!');
        }
    }

    // DELETE
    public async deletePostById(query: Query<number | string | boolean>) {
        try {
            await PostModel.deleteMany(query);
        } catch (error) {
            console.error('Wystąpił błąd podczas usuwania danych:', error);
            throw new Error('Wystąpił błąd podczas usuwania danych');
        }
    }

    public async deleteAllPosts() {
        try {
            await PostModel.deleteMany();
        } catch (error) {
            console.error('Wystąpił błąd podczas usuwania danych:', error);
            throw new Error('Wystąpił błąd podczas usuwania danych');
        }
    } 
}  

export default DataService;