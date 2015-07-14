# data-mapper
This takes a domino csv and maps rows to a hierarchy of tables. It does so in 4 parts.

1. This reads csv, sql, and json files into javascript objects,
2. This offers a quick view to adjust or build a json mapping file
3. This spits out sql insert statements based on the mapping file and data
4. This takes a dump fo the completed table and the original csv to check if theres skipped columns in the original data.

### running
drop the whole project into a folder and run it in browser. its all client side.
Most of it requires a csv file and main table and sub tables. json is optional and duplicated by the edit section

### the mapping
the map is a json object. the import json button is just calling json.parse on the content.
the edit map file section tries to load with the json file content. otherwise, it just creates a new map.
three objects are calculated. They are calculated on part 1, reading in raw files into javascript objects.

1. $id. the fake primary key number that increments with each row.
2. $fk. pulls from $id.
3. $lineNumber. if column name has an underscore number, returns that number. eg: amount, amount_1, amount_2 returns 0, 1, 2

example mapping

    {
      main_table_name:{
        mysql_id: $id,                 //i must set the id to make sure it matches $fk.
        mysql_col_name: csv_col_name
      },
      sub_table_1_name:{
        my_subtable_fk: $fk,           //i leave off the id for this table. when inserted, it'll generate one. only fk must match the main table id.
        another_mysql_col_name: amount //i leave off the number. it adds a new line for amount, amount_1, and amount_2. automatically looks for the number bit.
      }
    }



### some offal
theres an internal object

    data:{
      mainTable:{},
      subTables:[],
      csv:{},
      map:{}
    }

