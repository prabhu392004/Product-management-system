from django.http import HttpResponse,JsonResponse
from .models import Product
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .serializers import productserializer


def build_response(message,status_code,data=None,errors=None):
    response_data={
        'status_code':status_code,
        'message':message
    }
    if data is not None:
        response_data['data']=data

    if errors is not None:
        response_data['errors']=errors

    return JsonResponse(data=response_data, status=status_code)


# Create your views here.
@csrf_exempt
@api_view(['GET','POST'])
def product_list_view(request):
    if request.method=="GET":
        products=Product.objects.all()
        serializer=productserializer(instance=products, many=True)
        return build_response('All products fetched successfully', status_code=status.HTTP_200_OK,data=serializer.data)




       
    if request.method =='POST':
        serializer=productserializer(data=request.data)


        if serializer.is_valid():
            Product.objects.create(**serializer.validated_data)

            return build_response('product created successfully',status_code=status.HTTP_201_CREATED,data=serializer.data)
        else:
            return build_response('Validation Failed',status_code=status.HTTP_400_BAD_REQUEST,errors=serializer.errors)
        




@csrf_exempt 
@api_view(['GET','PUT','PATCH','DELETE'])  
def product_detail_view(request,product_id):
    try:
        product=Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return build_response('Resource Not Found',status_code=status.HTTP_404_NOT_FOUND,errors='Product Id doest not exists')
    
        
    if request.method=='GET':
        serializer=productserializer(instance=product)
        return build_response('product found successfully',status_code=status.HTTP_200_OK,data=serializer.data)


    if request.method=="PUT":
        serializer=productserializer(data=request.data)


        if serializer.is_valid():
            product.name=serializer.validated_data.get('name')
            product.price=serializer.validated_data.get('price')
            product.quantity=serializer.validated_data.get('quantity')
            product.brand=serializer.validated_data.get('brand')


            product.save()


            return build_response('product replaced successfully',status_code=status.HTTP_200_OK,data=serializer.data)
        else:
            return build_response('validation failed', status_code=status.HTTP_400_BAD_REQUEST,errors=serializer.errors)


     

    


    if request.method=='PATCH':
        serializer=productserializer(data=request.data,instance=product,partial=True)

        if serializer.is_valid():
            product.name=serializer.validated_data.get('name',product.name)
            product.price=serializer.validated_data.get('price',product.price)
            product.quantity=serializer.validated_data.get('quantity',product.quantity)
            product.brand=serializer.validated_data.get('brand',product.brand)

            product.save()

            return build_response('product updated successfully', status_code=status.HTTP_200_OK,data=serializer.data)
        else:
            return build_response('validation failed',status_code=status.HTTP_404_BAD_REQUEST,errors=serializer.errors)
            


    if request.method=="DELETE":
        product.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

    
        
        


        

    

    



