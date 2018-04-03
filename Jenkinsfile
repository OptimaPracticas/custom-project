#!/usr/bin/env groovy

//try{

  node {
    stage('Initialize') {
      bat 'echo Initializing...'
      def node = tool name: 'Node-8.9.0', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
      env.PATH = "${node}/bin:${env.PATH}"

      //String emailTo = 'ismael.nunez@optimaonline.es'

    }

    stage('Fetching repository') {
      bat 'echo Downloading repository files...'
      checkout scm
    }

    stage('Build') {
      //bat 'npm install -g grunt-cli'
      //bat 'rmdir /S /Q node_modules mobile'
      bat 'npm install'
      bat 'node node_modules\\grunt-cli\\bin\\grunt build'
    }
  }

// }catch (exc){
// mail subject: "${env.JOB_NAME} (${env.BUILD_NUMBER}) failed",
//        body: "\u2622 It appears that ${env.BUILD_URL} is failing, somebody should do something about that",
//          to: emailTo,
//     replyTo: emailTo,
// from: 'noreply@ci.jenkins.io'
// }
