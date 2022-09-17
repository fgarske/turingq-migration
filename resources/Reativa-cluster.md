# **A cada restart do PC, os passos abaixo devem ser seguidos:** 

1. Deletar cluster kind do kubernetes e reiniciar registry no docker
   kind delete cluster --name=turingq-local
2. startar o registry
3. rodar script para criação do cluster kind no docker
   cd ~/turingq-migration/resources/kubernetes
   sh create-kind-cluster.sh
   kubectl cluster-info --context kind-turingq-local
4. criar e taguear a imagem do keycloack para publicar no registry
   docker build -t turingq/authorizer-config:latest -f packages/authorizer/Dockerfile.prod .
   docker tag turingq/authorizer-config localhost:5000/turingq-authorizer-config
5. enviar imagem para o registry
6. docker push localhost:5000/turingq-authorizer-config
7. aplicar job de configuração do keycloak e do authorizer-config no kubernetes
   kubectl apply -f packages/authorizer/k8s/
   kubectl apply -f packages/authorizer/k8s/authorizer-config/
   kubectl describe job/authorizer-config-job
8. conferir se os pods estão rodando
   kubectl get po
9. encaminhar a porta do keycloak para poder acessar no browser
    kubectl port-forward svc/authorizer-service 8000:8080
10. acessar keycloak
    http://localhost:8000/auth/



  