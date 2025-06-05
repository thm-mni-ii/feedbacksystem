FROM jupyter/all-spark-notebook

RUN pip install jupyter_kernel_gateway

ENV KG_ALLOW_ORIGIN=*
ENV KG_ALLOW_HEADERS=*
ENV KG_ALLOW_METHODS=*
ENV KG_TOKEN=
ENV KG_LIST_KERNELS=true
ENV KG_ALLOW_REMOTE_ACCESS=true

EXPOSE 8888
CMD ["jupyter", "kernelgateway", \
     "--KernelGatewayApp.ip=0.0.0.0", \
     "--KernelGatewayApp.port=8888" \
]