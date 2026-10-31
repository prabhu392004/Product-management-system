from django.http import HttpResponse,JsonResponse
from .models import Product
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import APIView
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
class product_list_view(APIView):

    def get(self,request):
        products=Product.objects.all()
        serializer=productserializer(instance=products, many=True)
        return build_response('All products fetched successfully', status_code=status.HTTP_200_OK,data=serializer.data)




       
    def post(self,request):
        serializer=productserializer(data=request.data)


        if serializer.is_valid():
            Product.objects.create(**serializer.validated_data)

            return build_response('product created successfully',status_code=status.HTTP_201_CREATED,data=serializer.data)
        else:
            return build_response('Validation Failed',status_code=status.HTTP_400_BAD_REQUEST,errors=serializer.errors)
        




class product_detail_view(APIView):  

    def get(self,request,product_id):
        product=get_object_or_404(Product,pk=product_id)
        serializer=productserializer(instace=product)

        return build_response('product found Successfully', status_code=status.HTTP_200_OK,data=ser)
   
    def put(self,request_id):
        product=get_object_or_404(Product,pk=product_id)   
        serializer=productserializer(data=request.data,insatnce=product)


        if serializer.is_valid():
            serializer.save()

            return build_response('product replaced successfully',status_code=status.HTTP_200_OK,data=serializer.data)
        else:
            return build_response("validation Failed",status_code=status.HTTP_400_BAD_REQUEST,errors=serializer.errors)
    

    def patch(self,request,product_id):
        product=get_object_or_404(product,pk=product_id)
        serializer=productserializer(data=request.data,instance=product,partial=TRUE)


        if serializer.is_valid():
            serializer.save()

            return build_response("product updated successfully",status_code=status.HTTP_200_OK,data=serializer.data)
        else:
            return build_response("validation Failed ",status_code=status.HTTP_400_BAD_REQUEST,errors=serializer.errors)

    def delete(self,request,product_id):
        prody=uct=get_object_or_404(product,pk=product_id)
        product.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)

            
     

    


    

            


    
        
        


        

    

    



