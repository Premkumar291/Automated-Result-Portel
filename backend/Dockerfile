# Use Node.js LTS (Long Term Support) version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Install PM2 globally
RUN npm install -g pm2

# Copy app source
COPY . .

# Expose the API port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
