# TestingifyREST
 OAS and ABC for Automated black-box testing of RESTful APIs
 
## Description
 An open-source automated black-box testing approach based on the provided Swagger OpenAPI Specefication for the API (SUT). [(A complete documentation on how to wirte OAS for your API)](https://swagger.io/specification/).
 Generates a complete Test Suite covering almost the wholte API (SUT) using an Enhanced version from the Artifical Bee Colony Algorithm (ABC).
 [The Front-end for the TestingifyREST App](https://github.com/SeifA7mad/testingify-app)
 
 ## How it works
  1. The user provide the OpenAPI Specefication for the API (SUT) he/she want to test and provide all the required security keys. 
  2. TestingifyREST analyse the provided OAS and start to generate Test Cases for the API using an Enhanced version from the evolutionairy algorithm ABC.
  3. TestingifyREST execute each Test Case against the API (SUT) to check if the Test Case passed or not.
  4. TestingifyREST send back to the user a complete Log that includes the complete Test Suite and A complete detailed results for each Test Case execution.
  
 ### How to contribute
  TestingifyREST App implemented as a RESTful API adheres to the MVC archeticture using Nodejs & Expressjs. Anyone is welcome to contribute and enhance this open-source project. If you want to contribute first clone the app from this repositry start editing or enhancing the app then make a pull request with a detailed description for what you modified and why.
