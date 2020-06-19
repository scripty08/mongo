import mongoose from 'mongoose';

let connection;

const retry = (connections) => {
    connection = connections;
};

export const mongo = (config) => {
    if (typeof connection === 'undefined') {

        const connectionUrl = `mongodb://${config.user}:${config.password}@${config.server}/${config.db}`;

        return new Promise((resolve) => {

            const options = {
                autoIndex: false,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500,
                poolSize: 10,
                bufferMaxEntries: 0
            };

            mongoose.connection.on('error', function(err){
                console.error(`${connectionUrl} error: ${err}`);
            });

            mongoose.connection.on('disconnected', function(){
                console.info('mongoose default connection is disconnected');
                setTimeout(connectWithRetry, 5000);
            });

            mongoose.connection.on('connected', function(){
                console.info('mongoose default connection is open');
            });

            mongoose.connection.on('reconnected', function () {
                console.info('mongoose reconnected!');
            });

            const connectWithRetry = () => {
                retry(mongoose.connect(connectionUrl, options).then((rec) => {
                    console.info('mongoose is connected!');
                    resolve(rec);
                }).catch(err=>{
                    console.error('mongoose connection unsuccessful, retry after 5 seconds.');
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
