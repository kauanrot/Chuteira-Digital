pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Executar testes (Jest)') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        success {
            echo 'Esteira executada com sucesso: todos os testes passaram.'
        }
        failure {
            echo 'A esteira falhou: verifique os logs dos testes acima.'
        }
    }
}
