raven-shell
===========

Command line shell for RavenDB (inspired by the MongoDB shell)

Overview
--------
The RavenDB studio is a Silverlight based web application.  Unfortunately, it crashes on every virtual machine I have tried (Virtual Box, VM Ware Fusion).  I also tend to use a Mac most of the time, so it would be nice to be able to access RavenDB via a Mac that does not have Silverlight.  It would also be nice to be able to use a command-line interface to do work with RavenDB.

Luckily, RavenDB has an excellent HTTP API, so this console application was written against that API, using the strong networking abilities of Node.js and its REPL (Read-Eval-Print-Loop).  Node.js is also natively JavaScript, so working with JSON documents in RavenDB seems a natrual fit.

Requirements
------------
* Node.js >= 0.6
* A RavenDB to access

Usage
-----
`shell
$ node shell
RavenDB shell
> .store http://someravendb.myorg.com:8080
Using datastore at: http://someravendb.myorg.com:8080
> .count Albums
246
> .docs Users
[ { firstName: 'Johnny',
    '@metadata':
     { 'Raven-Entity-Name': 'Users',
       '@id': '1e0c2a96-2d3e-4fb9-89be-b138e8404e95',
       'Temp-Index-Score': 4.951243877410889,
       'Last-Modified': '2012-05-12T17:56:41.8740000',
       '@etag': '00000000-0000-0800-0000-000000000008',
       'Non-Authoritative-Information': false } },
  { id: 'users/frank',
    firstName: 'Frank',
    lastName: 'Jenkins',
    '@metadata':
     { 'Raven-Entity-Name': 'Users',
       '@id': 'users/frank',
       'Temp-Index-Score': 4.951243877410889,
       'Last-Modified': '2012-05-12T21:06:41.5600000',
       '@etag': '00000000-0000-0800-0000-00000000000a',
       'Non-Authoritative-Information': false } },
  { id: 'users/leeroy',
    firstName: 'Leeroy',
    '@metadata':
     { 'Raven-Entity-Name': 'Users',
       '@id': 'users/leeroy',
       'Temp-Index-Score': 4.951243877410889,
       'Last-Modified': '2012-05-12T22:44:54.7630000',
       '@etag': '00000000-0000-0800-0000-00000000000c',
       'Non-Authoritative-Information': false } } ]
> .count Users
3
> .create Users { id: 'users/mamma', firstName: 'Mamma', lastName: 'Jenkins'}
{ Key: 'users/mamma',
  ETag: '00000000-0000-0900-0000-000000000002' }
>_.Key
'users/mamma'
> .find {firstName: 'Leeroy'}
[ { id: 'users/leeroy',
    firstName: 'Leeroy',
    '@metadata':
     { 'Raven-Entity-Name': 'Users',
       '@id': 'users/leeroy',
       'Temp-Index-Score': 4.951243877410889,
       'Last-Modified': '2012-05-12T22:44:54.7630000',
       '@etag': '00000000-0000-0800-0000-00000000000c',
       'Non-Authoritative-Information': false } } ]
> var leeroy = _[0]
undefined
> leeroy
{ id: 'users/leeroy',
  firstName: 'Leeroy',
  '@metadata':
   { 'Raven-Entity-Name': 'Users',
     '@id': 'users/leeroy',
     'Temp-Index-Score': 4.951243877410889,
     'Last-Modified': '2012-05-12T22:44:54.7630000',
     '@etag': '00000000-0000-0800-0000-00000000000c',
     'Non-Authoritative-Information': false } }
> .read users/mamma
{ id: 'users/mamma',
  firstName: 'Mamma',
  lastName: 'Jenkins',
  '@metadata':
   { 'Raven-Entity-Name': 'Users',
     '@id': 'users/mamma',
     'Temp-Index-Score': 1.4054651260375977,
     'Last-Modified': '2012-05-12T23:43:01.8700000',
     '@etag': '00000000-0000-0900-0000-000000000002',
     'Non-Authoritative-Information': false } } ]
> .delete users/mamma
> .read users/mamma
[Error: Error: 404 - ]
> .exit
$ 
`