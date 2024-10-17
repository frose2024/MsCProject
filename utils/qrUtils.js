// This file is for : QR code generation and handling. Need to be able to encode information in the qr code. 
// Admin scans QR code, sends a request to the server for the user points. Can then alter user point total by sending another request. 
// So, all that needs to be encoded in the QR code is a request to the server to get the correct  user point data. 
    // Admin will be able to access this because when they scan the QR code using the app, the request will be sent with their admin JWT token attached. 