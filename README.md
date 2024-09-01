## Introduction

This document describes the low-level design of an image processing system built with Node JS and a chosen database MongoDB. The system will asynchronously process image data received through a CSV file upload, compress the images by 50%, and store the processed data with product information in the database. Additionally, the system offers APIs for uploading files, checking processing status, and webhooks updates.


>[!NOTE]
>For now, notifications are sent to a single webhook URL: https://ntfy.cosmos.0xdeepak.co/sde-assignment-webhook. To receive these notifications, visit https://ntfy.cosmos.0xdeepak.co/ and subscribe to the topic `sde-assignment-webhook`.

## System Design

![System Design Diagram](https://apidog.com/api/v1/projects/651904/resources/344741/image-preview)

### The system consists of the following components:
- **API Server**:
    - Accepts file uploads (CSV) and checks for valid content types.
    - Routes requests to the Upload Service.
    - Receives requests for checking processing status and routes them to the Status Service.
- **S3 Bucket**:
    - Stores uploaded CSV files and compressed images.
- **MongoDB Database**:
    - Stores batch information (ID, status, s3key, message, timestamp)
    - Stores product information (ID, S.no, Product name, Input Urls, Output Urls)
- **Redis**:
    - Used for Message Queue
    - Manages asynchronous tasks for image processing.
- **Worker**:
    - Consumes jobs from the Redis queue.
    - Retrieves the corresponding CSV file from S3.
    - Processes images from the CSV, compressing them by 50%.
     - Updates the output image URLs in MongoDB.
    - Updates the processing status in MongoDB.
    - Triggers a webhook upon processing completion.

## Database Schema
**Batch Schema**
 ``` ts
 {
    _id: string;
    status: 'completed' | 'in progress' | 'in queue' | 'failed',;
    s3Key: string;
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
```

**Product Schema**
```ts
	_id: string;
    serial_no: number;
    product_name: string;
    batch_id: string;
    input_image_urls: string[];
    output_image_urls: string[];
    createdAt?: Date;
    updatedAt?: Date;
```

## Asynchronous Workers

### Initialization and Database Connection
- **Connect to the MongoDB database**: Using the `mongoose` library.
- **Initialize S3 client**: Creates an instance of S3Client with the necessary AWS credentials and region.

### Job Processing

- **Updates batch status**: Marks the batch as 'in progress' in the database.
- **Retrieves CSV stream from S3**: Uses the `@aws/sdk` library to get the CSV file from S3 based on the s3Key in the job data.
- **Parses and validates CSV**: Uses `@fast-csv/parse` library to parse the CSV, validates each row using `zod`, and handles invalid rows.
- **Processes each row**:
    - For each valid row, processes each image URL and create image buffer.
    - Compresses the image from image buffer using the `sharp` library.
    - Uploads the compressed image to S3 with public access.
    - Creates a product record in the database with the input and output image URLs.
- Updates batch status and sends webhook: Marks the batch as 'completed' and sends a webhook notification.

### Error Handling and Webhook
- Handles job failures by updating the batch status to 'failed' and error message.
- Webhook handling: Sends a webhook notification upon successful batch processing.


