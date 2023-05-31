library(
    identifier: 'eng-jenkins-library@v1.0.0',
    retriever: modernSCM([
        $class       : 'GitSCMSource',
        credentialsId: 'github.com/users/performbot/ssh/private_key',
        remote       : 'git@github.com:statsperform/eng-jenkins-library.git',
        traits       : [[$class: 'WipeWorkspaceTrait']],
    ])
)

standardPipeline()
