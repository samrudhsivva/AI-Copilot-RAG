import uuid

WIDGET_STORE = {}

def save_widget(title, data, endpoint):
    widget_id = str(uuid.uuid4())
    WIDGET_STORE[widget_id] = {"title": title, "data": data, "endpoint": endpoint}
    return {"id": widget_id, "message": "Widget saved successfully!"}

def get_widget_by_id(widget_id):
    return WIDGET_STORE.get(widget_id, {})
