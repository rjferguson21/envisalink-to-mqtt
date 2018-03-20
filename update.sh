docker build -t rjferguson21/envisalink-to-mqtt2 .
docker push rjferguson21/envisalink-to-mqtt2
kubectl scale --replicas=0 deployment/envisalink-to-mqtt
kubectl scale --replicas=1 deployment/envisalink-to-mqtt