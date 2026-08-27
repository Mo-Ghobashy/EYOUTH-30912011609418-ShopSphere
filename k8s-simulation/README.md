# Kubernetes namespace simulation — EYOUTH-30912011609418-ShopSphere

Two isolated namespaces, each with a frontend pod/service and a backend pod/service.

| Namespace | Folder |
|-----------|--------|
| `aws-simulation` | `k8s-simulation/aws-simulation/` |
| `gcp-simulation` | `k8s-simulation/gcp-simulation/` |

## Apply

```bash
kubectl apply -f k8s-simulation/aws-simulation
kubectl apply -f k8s-simulation/gcp-simulation
```

## Verify both namespaces exist

```bash
kubectl get ns
kubectl -n aws-simulation get pods,svc
kubectl -n gcp-simulation get pods,svc
```

Wait until pods are `Running`.

## Port-forward (services respond)

Terminal 1 — AWS frontend:

```bash
kubectl -n aws-simulation port-forward svc/frontend-service 8080:80
```

Open http://127.0.0.1:8080

Terminal 2 — GCP backend:

```bash
kubectl -n gcp-simulation port-forward svc/backend-service 5001:5000
```

```bash
curl http://127.0.0.1:5001/api/health
```

You can also forward AWS backend (`5000:5000`) and GCP frontend (`8081:80`) the same way.

## Isolation (resources in one namespace are not visible from the other)

```bash
kubectl -n aws-simulation get all
kubectl -n gcp-simulation get all
```

Pods and services named for AWS must **not** appear in the GCP listing, and vice versa.

```bash
kubectl -n aws-simulation get pods -l app=shopsphere-backend
kubectl -n gcp-simulation get pods -l app=shopsphere-backend
```

Each command lists only the pod in **that** namespace.

## Cleanup

```bash
kubectl delete -f k8s-simulation/aws-simulation
kubectl delete -f k8s-simulation/gcp-simulation
```
