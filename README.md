webserver_myIP
==============

A Node-Express Webserver on AWS EC2 with a MongoDB noSQL database on the same instance

a server-side application to demonstrate running a node Webserver and a mongo DB on AWS EC2.
Uses the Express and Mongoose node packages. 

on a clean EC2 instance, install node and npm and mongo
$ sudo yum install gcc-c++ make
$ sudo yum install nodejs npm --enablerepo=epel

$ sudo yum install mongodb-org

Go to the Security Groups for the MongoDB instance, and create a new inbound rule: 
open port 27017 for the node instance's security group so that database requests from there will be let throught the firewall.
Next install the express and mongoose node packages on the node instance, using
 $ sudo npm install mongoose
 $ sudo npm install express
 
Open a web browser and navigate to the IP address of your Node EC2 instance, appending port 8080
E.g. http://20.152.23.128:8080

You should see the Hello World appear in the browser window. 

(c) 2016 Pink Pelican Ltd
