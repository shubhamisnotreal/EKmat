FROM node:20-alpine AS builder

WORKDIR /app
# Copy package files
COPY package*.json ./
RUN npm install
# Copy source
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
