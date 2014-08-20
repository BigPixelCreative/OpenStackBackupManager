OpenStackBackupManager
======================

A Backup Manager for Openstack. This requires the OpenStackBackup task runner to function, and a mongodb connection.

Due to the restrictions of the OpenStack framework, it is difficult to keep backups of running instances, especially when you have multiple clients. This dashboard serves as an administrative interface to enable people to moniter and trigger backups, or snapshots of OpenStack instances. The actual operations with OpenStack for the most part exist in the companion project OpenStackBackup which acts as a task runner and queueing engine for the backup process.

## Environmental Variables

All the following are required to run. If using [foreman](https://github.com/ddollar/foreman), then place variables in a `.env` file in the application root.

* **NODE_ENV** - Declare the node environment.
* **DECRYPTION_KEY** - A long key to encrypt and decrypt password data for OpenStack.
* **MONGOHQ_URL** - The full mongodb url string with the username and password included.

## Getting Started

1. Clone the repo to your destination.
2. Setup a mongodb with the following collections
    - users
    - clients
    - jobs
3. Setup the environment variables.
4. Create users using the `pass_create.js` script.
5. Serve website using nginx, heroku, or similar.
6. Login to site using credentials you setup in the `pass_create.js` script.
