import cors from 'cors';
//lista de origines permitidos
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL ||'')
.split(',')
.map(origin => origin.trim())
.filter(Boolean);

//opciones de cors
const corsOptions ={
    origin : (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin)){
            return callback(null,true);
        }
        return callback(new Error('Acceso no permitido por politica de CORS'));
    },
    methods: ['GET','POST','PATCH','OPTIONS'],//metodos que permite
    allowedHeaders:['Content-Type','Authorization','Idempotency-Key'],//cabeceras que permite
    credentials:true//permite el intercambio de cookies
};

export default cors(corsOptions);
