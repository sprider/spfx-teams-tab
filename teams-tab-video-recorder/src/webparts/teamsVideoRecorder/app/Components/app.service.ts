import { Injectable } from '@angular/core';
import { MSGraphClient } from '@microsoft/sp-http';

@Injectable()

export class AppService {

    constructor() { }

    uploadFile(graphClient: MSGraphClient, arrayBuffer: any, fileName: string): Promise<string> {

        let retVal: Promise<any> = Promise.resolve();

        retVal = new Promise((resolve, reject) => {

            try {
                graphClient
                .api('/me/drive/items/root:/' + fileName + ':/content')
                .put(arrayBuffer, (error, response: any, rawResponse?: any) => {

                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    resolve(response);
                });
            }
            catch (err) {
                reject(err);
            }
        });

        return retVal;
    }

}