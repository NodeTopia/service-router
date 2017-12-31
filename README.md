# service-router
Router service

All jobs that this service use are `kue` processes.

## Run
RUN NOTES:
- This process can be run in the system.
- Can be run as a standalone.
```
node index.js /path/to/config/file.json
```


## router.add.url
Adds a url to the redis DB. Must be callled first.
- `url` String URL to route: `my.site.example.com`
- `name` String Route name: `my-site`
- `organization` String Organization name: `myorg`
- `metricSession` String Applications metric session uuid: `75496454-76e6-48e8-8a06-afc591e72703`
- `logSession` String Applications logging: `0d9ba3cd-410b-4af5-ba8a-61fe826e101c`
## router.add.host
Adds route infomation. `router.add.url` must be called first for each `urls`
- `urls` []String Array of urls to add host and port to: `[my.site.example.com]`
- `name` String Host name: `web.0`
- `port` Number Port number to route to: `8080`
- `host` String IP to router to: `1.23.45.67`
## router.add.tls
Adds TLS keys to the redis DB
- `url` String URL that the keys belong to: `my.site.example.com`
- `key` String TLS key: `-----BEGIN RSA PRIVATE KEY-----...`
- `certificate` String TLS certificate `-----BEGIN CERTIFICATE-----...`
## router.remove.url
removes url from the redis DB. Must call `router.add.url` if you want to use the url again.
- `url` String removed the url and all host information: `my.site.example.com`
## router.remove.host
removes route infomation.
- `urls` []String Array of urls to removes host and port: `[my.site.example.com]`
- `name` String Host name: `web.0`
- `port` Number Port number to route to: `8080`
- `host` String IP to router to: `1.23.45.67`
## router.remove.tls
removes url TLS from the redis DB.
- `url` String Removes the TLS for the url: `my.site.example.com`
## router.info
Calls a lrange on the redis DB.
- `url` String URL to query the info on: `my.site.example.com`