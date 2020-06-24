import mongoose from 'mongoose';
import { Logger } from '@scripty/logger';

let connection;

const retry = (connections) => {
    connection = connections;
};

export const mongo = (config) => {
    if (typeof connection === 'undefined') {

        const connectionUrl = `mongodb://${config.user}:${config.password}@${config.server}/${config.db}:${config.port}`;

        return new Promise((resolve) => {

            const options = {
                autoIndex: false,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500,
                poolSize: 10,
                bufferMaxEntries: 0
            };

            mongoose.connection.on('error', function(err){
                Logger.error(`${connectionUrl} error: ${err}`);
            });

            mongoose.connection.on('disconnected', function(){
                Logger.info('mongoose default connection is disconnected');
                setTimeout(connectWithRetry, 5000);
            });

            mongoose.connection.on('connected', function(){
                Logger.info('mongoose default connection is open');
            });

            mongoose.connection.on('reconnected', function () {
                Logger.info('mongoose reconnected!');
            });

            const connectWithRetry = () => {
                retry(mongoose.connect(connectionUrl, options).then((rec) => {
                    Logger.info('mongoose is connected!');
                    resolve(rec);
                }).catch(err=>{
                    Logger.error('mongoose connection unsuccessful, retry after 5 seconds.');
                    resolve(false);
                    setTimeout(connectWithRetry, 5000);
                }));
            };

            connectWithRetry()
        })

    } else {
        return connection;
    }
};
