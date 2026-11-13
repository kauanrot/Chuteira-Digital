pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    environment {
        EC2_HOST = '3.134.155.227'
        EC2_USER = 'ubuntu'
        APP_DIR  = '/home/ubuntu/Chuteira-Digital'
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

        stage('Deploy na AWS (EC2)') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new ${EC2_USER}@${EC2_HOST} \
                          "cd ${APP_DIR} && git pull origin main && docker compose up -d --build && docker image prune -f"
                    '''
                }
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    for i in 1 2 3 4 5 6; do
                        curl -fs http://${EC2_HOST}/api/health && exit 0
                        sleep 10
                    done
                    exit 1
                '''
            }
        }
    }

    post {
        success { echo 'Esteira concluida: testes OK e deploy realizado.' }
        failure { echo 'A esteira falhou: verifique os logs acima.' }
    }
}
