# start from the jupyter image with R, Python, and Scala (Apache Toree) kernels pre-installed
FROM jupyter/all-spark-notebook

# install the kernel gateway

RUN pip install jupyter_kernel_gateway==2.0
# run kernel gateway on container start, not notebook server
EXPOSE 8888
CMD ["jupyter", "kernelgateway", \
     "--KernelGatewayApp.ip=0.0.0.0", \
     "--KernelGatewayApp.port=8888", \
     "--KernelGatewayApp.allow_origin='*'", \
     "--KernelGatewayApp.allow_headers='*'", \
     "--KernelGatewayApp.allow_methods='*'", \
     "--KernelGatewayApp.auth_token=''", \
     "--JupyterWebsocketPersonality.list_kernels=true"]