# Notemy-API
- API Usage/Example/Test :
  https://notemy-api.deta.dev

## Tutorial :
#### API Base Endpoint : `https://notemy-api.deta.dev/api/v1`
##### USER :
- User Registration Endpoint : `/auth/register` <br>
 Request Type : `POST`<br>
 **Required Values in JSON body* `email` `username` `password`
 
 - User Login Endpoint : `/auth/login` <br>
 Request Type : `POST`<br>
 **Required Values in JSON body* `email` `password`
 
 - User Info Endpoint : `/auth/me` <br>
 Request Type : `GET`<br>
  **Required header* `Authorization : Bearer <TOKEN>`
  
  
 ##### NOTES
 -  Get Notes Endpoint : `/notes` <br>
 Request Type : `GET`<br>
 **Required header* `Authorization : Bearer <TOKEN>`
 
 - Add Note Endpoint : `/notes/` <br>
Request Type: `POST`<br>
 **Required header* `Authorization : Bearer <TOKEN>`<br>
 **Required Values in JSON body* `title` `content` 
 
  - Notes Search Endpoint : `/notes/search` <br>
 Type of Request : `GET`<br>
 **Required header* `Authorization : Bearer <TOKEN>`<br>
 **Required value Query* `query`
 
  - Note Details Endpoint : `/notes` <br>
 Type of Request : `GET`<br>
 **Required header* `Authorization : Bearer <TOKEN>`<br>
 **Required Values in path* `id`
 
   - Note Update Endpoint : `/notes` <br>
 Type of Request : `PUT`<br>
 **Required header* `Authorization : Bearer <TOKEN>`<br>
 **Required Value in path* `id`
 **Required Values in JSON body* `title` `content`
 
  - Note Delete Endpoint : `/notes` <br>
 Type of Request : `DELETE`<br>
 **Required header* `Authorization : Bearer <TOKEN>`<br>
 **Required Values in path* `id`
 
 ## Support me :
<a href="https://www.buymeacoffee.com/debiprasadxd">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="buy me a coffee" width="120" height="34" />
</a>

 