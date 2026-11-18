import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.views import APIView
from rest_framework import status
from .models import Product
from .serializers import productserializer


def build_response(message, status_code, data=None, errors=None):
    response_data = {
        'status_code': status_code,
        'message': message
    }
    if data is not None:
        response_data['data'] = data

    if errors is not None:
        response_data['errors'] = errors

    return JsonResponse(data=response_data, status=status_code)


class product_list_view(APIView):
    def get(self, request):
        products = Product.objects.all().order_by('-id')
        serializer = productserializer(instance=products, many=True)
        return build_response('All products fetched successfully', status_code=status.HTTP_200_OK, data=serializer.data)

    def post(self, request):
        serializer = productserializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return build_response('Product created successfully', status_code=status.HTTP_201_CREATED, data=serializer.data)
        else:
            return build_response('Validation Failed', status_code=status.HTTP_400_BAD_REQUEST, errors=serializer.errors)


class product_detail_view(APIView):
    def get(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        serializer = productserializer(instance=product)
        return build_response('Product found successfully', status_code=status.HTTP_200_OK, data=serializer.data)

    def put(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        serializer = productserializer(instance=product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return build_response('Product replaced successfully', status_code=status.HTTP_200_OK, data=serializer.data)
        else:
            return build_response('Validation Failed', status_code=status.HTTP_400_BAD_REQUEST, errors=serializer.errors)

    def patch(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        serializer = productserializer(instance=product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return build_response('Product updated successfully', status_code=status.HTTP_200_OK, data=serializer.data)
        else:
            return build_response('Validation Failed', status_code=status.HTTP_400_BAD_REQUEST, errors=serializer.errors)

    def delete(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        product.delete()
        return build_response('Product deleted successfully', status_code=status.HTTP_200_OK)


def frontend_view(request):
    """Serves the integrated single-page dashboard frontend with preloaded products."""
    products = Product.objects.all().order_by('-id')
    serializer = productserializer(instance=products, many=True)
    return render(request, 'index.html', {
        'initial_products_json': json.dumps(serializer.data),
    })
