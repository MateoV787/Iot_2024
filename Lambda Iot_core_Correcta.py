#Lambda Iot_core_Correcta

import math
import boto3
import json
from decimal import Decimal

# Get dynamodb resource
dynamodb = boto3.resource('dynamodb')
def lambda_handler(event, context):
    
    temperature = event['temp']
    if temperature > 30:
        ses_client = boto3.client('ses')
        response = ses_client.send_email(  
            Source='iot.meng.2.2024@gmail.com',  
            Destination={  
                'ToAddresses': ['mvalenciab@uqvirtual.edu.co'],  
            },  
            Message={  
                'Subject': {  
                    'Data': 'Alerta de Temperatura Alta',  
                },  
                'Body': {  
                    'Text': {  
                        'Data': f'La temperatura ha superado los 30 °C: {temperature} °C',  
                    },  
                },  
            }  
        )
     
   
    # JSON object from IoT core has timestamp field
    if 'timestamp' in event:
        # Get table
        table = dynamodb.Table('dth22_1_table_mt')
        
        # Put item into table
        response = table.put_item(
        Item={
        'dth22_id': "sensor", # Primary key
        'timestamp': event['timestamp'], # Sort key
        'temp': event['temp'],
        'hum': event['hum']
        }
        )
        
        # Print put_item response
        print(response)
        
        # Get recently written item
        response = table.get_item(
        Key={'dth22_id': "sensor", 'timestamp': event['timestamp']}
        )
        
        # Print get_item response
        print(response)
        
        # Print table scan results
        #print(table.scan()['Items'])
        table = dynamodb.Table('ws_connection_id_mt')
   
        response = table.get_item(
        Key={'dth22_id': "connectionid"}
        )
        print(response)
        
        if 'Item' in response:
            api_client = boto3.client('apigatewaymanagementapi',endpoint_url='https://g9l3d0cfg2.execute-api.us-east-1.amazonaws.com/production')
            connectionId=response['Item']['id']
            api_client.post_to_connection(ConnectionId=connectionId, Data=json.dumps({'temp': event['temp'],'hum':event['hum']}))
            print(connectionId)
        
        
        # Return
        return "DB updated"
