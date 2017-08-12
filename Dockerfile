FROM python:2

RUN \
  pip install --no-cache-dir \
    bottle \
    pymongo

COPY . /usr/src/MongoAnyman/
WORKDIR /usr/src/MongoAnyman/

CMD [ "python", "./intel.py" ]
