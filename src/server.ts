/**
 * @name server
 *
 * @description The entry point for the app
 * @author Sukhdeep Singh
 */


import App from "./app";
import { PORT, HOST } from './utils/secret.util';

// Code profiling 
require('newrelic');


// start listening to server on specified port
App.listen(PORT, HOST, () => {
    console.log(`Application running on ${PORT}`);
}); 