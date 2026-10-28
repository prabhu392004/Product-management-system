from django.http import HttpResponse
from .models import Product
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
@csrf_exempt
def product_list_view(request):
    if request.method=="GET":
        products=Product.objects.all()
        PRODUCTS =[]
        for product in products:
            pro_dict={
                'id':product.id,
                'name':product.name,
                'price':product.price,
                'quantity':product.quantity,
                'brand':product.brand

            }
            PRODUCTS.append(pro_dict)
        json_data=json.dumps(PRODUCTS)
        return HttpResponse(json_data,content_type='application/json',status=200)

    if request.method =='POST':
        request_data=json.loads(request.body)


        product=Product.objects.create(**request_data)

        python_data={
            'message':'Product Created Successfully',
            'data':{
                'id':product.id,
                'name':product.name,
                'price':product.price,
                'quantity':product.quantity,
                'brand':product.brand
            }
        }

        response_data=json.dumps(python_data)


        return HttpResponse(response_data,content_type='application/json',status=201)
    python_data={
        'data':"only 'GET' and 'POST' methods are Supported"
    }
    response_data=json.dumps(python_data)
    return HttpResponse(response_data,content_type='application/json',status=405)


@csrf_exempt   
def product_detail_view(request,product_id):
    try:
        product=Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        python_data={
            'errors':'product id does not exists'
        }
        response_data=json.dumps(python_data)
        return HttpResponse(response_data,content_type='appllication/json',status=400)

    if request.method=='GET':
        python_data={
            'message':'product found successfully',
            'data':{
                'id':product.id,
                'name':product.name,
                'price':product.price,
                'quantity':product.quantity,
                'brand':product.brand
            }
        }
        response_data=json.dumps(python_data)
        return HttpResponse(response_data,content_type='application/json',status=200)


    if request.method=="PUT":
        request_data=json.load(request.body)


        required_fields=['name','price','quantity','brand']


        missing_fields=[]
        for field in required_fields:
            if field not in request_data:
                missing_fields.append(field)
        if  missing_fields:
            python_data={
                'errors': 'missing Fields'
            }
            fields={}
            for field in missing_fields:
                fields[field]='Field is Mandatory'
            python_data['fields']=fields

            response_data=json.dumps(python_data)
            return HttpResponse(response_data,content_type='application/json',status=400)
        product.name=request_data.get('name')
        product.price=request_data.get('price')
        product.quantity=request_data.get('quantity')
        product.brand=request_data.get('brand')

        product.save()

        python_data={
            'message':'product replaced successfully',
            'data':{
                'id':product.id,
                'name':product.name,
                'price':product.price,
                'quantity':product.quantity,
                'brand':product.brand
            }
        }

        response_data=json.dumps(python_data)
        return HttpResponse(response_data,content_type='application/json',status=200)


    if request.method=='PATCH':
        try:
            request_data=json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponse(json.dumps({'error':"invalid Json"}),content_type='application/json',status=400)
        allowed_fields=['name','price','quantity','brand']
        for  field in allowed_fields:
            if field in request_data:
                setattr(product,field,request_data[field])
        product.save()
        python_data={
            'message':"product updated successfully",
            'data':{
                            'id':product.id,
                            'name':product.name,
                            'price':product.price,
                            'quantity':product.quantity,
                            'brand':product.brand
                }
        }
        return HttpResponse(json.dumps(python_data),content_type='application/json',status=200)


        
        


        

    

    



