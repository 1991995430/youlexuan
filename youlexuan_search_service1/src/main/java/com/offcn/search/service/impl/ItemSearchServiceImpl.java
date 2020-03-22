package com.offcn.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.fastjson.JSON;
import com.github.promeg.pinyinhelper.Pinyin;
import com.offcn.pojo.TbItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.*;

@Service
@org.springframework.stereotype.Service
public class ItemSearchServiceImpl implements ItemSearchService {

    @Autowired
    private SolrTemplate solrTemplate;
    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {

        //关键字空格处理
        String keywords = (String)searchMap.get("keywords");
        searchMap.put("keywords",keywords.replace(" ",""));

        Map<String,Object> map = new HashMap<>();

        //1.查询列表
        map.putAll(searchList(searchMap));
        //System.out.println("查询到的map集合：：："+map);

        List categoryList = searchCategoryList(searchMap);

        if(categoryList!=null){
            map.putAll(searchBrandAndSpecList((String)categoryList.get(0)));
        }
        map.put("categoryList",categoryList);
        System.out.println("返回的map集合为：：："+map);
        return map;

        /*//创建查询器对象
        SimpleQuery query = new SimpleQuery();
        //设置查询条件
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        //添加查询条件到查询器对象
        query.addCriteria(criteria);
        //发出solr查询请求
        ScoredPage<TbItem> page = solrTemplate.queryForPage(query, TbItem.class);
        //获取查询结果记录集合
        map.put("rows",page.getContent());*/
        //创建高亮关键词查询器对象

    }

    @Override
    public void importList(List<TbItem> list) {

        for(TbItem item:list){
            System.out.println(item.getTitle());
            Map specMap = JSON.parseObject(item.getSpec(),Map.class);//从数据 库中提取规格 json 字符串转换为 map
            Map map = new HashMap();

            for(Object key : specMap.keySet()) {
                map.put("item_spec_"+Pinyin.toPinyin((String)key, "").toLowerCase(),
                        specMap.get(key));
            }
            item.setSpecMap(map);//给带动态域注解的字段赋值
        }
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    @Override
    public void deleteByGoodsIds(List goodsIdList) {
        System.out.println("删除商品 ID"+goodsIdList);
        Query query=new SimpleQuery();
        Criteria criteria = new Criteria("item_goodsid").in(goodsIdList);
        query.addCriteria(criteria);
        solrTemplate.delete(query);
        solrTemplate.commit();
    }


    private Map searchList(Map searchMap){

        Map map = new HashMap();

        HighlightQuery query = new SimpleHighlightQuery();

        if(!"".equals(searchMap.get("category"))){
            Criteria filterCriteria=new
                    Criteria("item_category").is(searchMap.get("category"));
            FilterQuery filterQuery=new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        if(!"".equals(searchMap.get("brand"))){
            Criteria filterCriteria=new
                    Criteria("item_brand").is(searchMap.get("brand"));
            FilterQuery filterQuery=new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);

        }
        if(searchMap.get("spec")!=null){
            Map<String,String> specMap= (Map) searchMap.get("spec");
            for(String key:specMap.keySet() ){
                Criteria filterCriteria=new Criteria("item_spec_"+ Pinyin.toPinyin(key,"").toLowerCase()).is( specMap.get(key) );
                FilterQuery filterQuery=new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }
        if(!"".equals(searchMap.get("price"))){
            String[] price = ((String)searchMap.get("price")).split("-");
            if(!price[0].equals("0")){
                Criteria filterCriterial = new Criteria("item_price").greaterThanEqual(price[0]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriterial);
                query.addFilterQuery(filterQuery);
            }
            if(!price[1].equals("*")){//如果区间终点不等于*
                Criteria filterCriteria=new
                        Criteria("item_price").lessThanEqual(price[1]);
                FilterQuery filterQuery=new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }

        Integer pageNo= (Integer) searchMap.get("pageNo");//提取页码
        if(pageNo==null){
            pageNo=1;//默认第一页
        }
        Integer pageSize=(Integer) searchMap.get("pageSize");//每页记录数
        if(pageSize==null){
            pageSize=20;//默认 20
        }
        query.setOffset((pageNo-1)*pageSize);//从第几条记录查询
        query.setRows(pageSize);

        String sortValue= (String) searchMap.get("sort");//ASC DESC
        String sortField= (String) searchMap.get("sortField");//排序字段
        if(sortValue!=null && !sortValue.equals("")){
            if(sortValue.equals("ASC")){
                Sort sort=new Sort(Sort.Direction.ASC, "item_"+sortField);
                query.addSort(sort);
            }
            if(sortValue.equals("DESC")){
                Sort sort=new Sort(Sort.Direction.DESC, "item_"+sortField);
                query.addSort(sort);
            }
        }

        HighlightOptions highlightOptions=new HighlightOptions().addField("item_title");//设置高亮的域
        highlightOptions.setSimplePrefix("<em style='color:red'>");//高亮前缀
        highlightOptions.setSimplePostfix("</em>");//高亮后缀
        query.setHighlightOptions(highlightOptions);//设置高亮选项
        //按照关键字查询
        Criteria criteria=new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);
        HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query,TbItem.class);
        for(HighlightEntry<TbItem> h: page.getHighlighted()){//循环高亮入口集合
        TbItem item = h.getEntity();//获取原实体类
        if(h.getHighlights().size()>0 &&h.getHighlights().get(0).getSnipplets().size()>0){
            item.setTitle(h.getHighlights().get(0).getSnipplets().get(0));//设置高亮的结果
        }
    }
        map.put("rows",page.getContent());
        map.put("totalPages", page.getTotalPages());//返回总页数
        map.put("total", page.getTotalElements());//返回总记录数
        //System.out.println("返回的map集合为：：："+map);
        return map;
}


    private List searchCategoryList(Map searchMap){
        List<String> list = new ArrayList<>();

        Query query = new SimpleQuery();

        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));

        query.addCriteria(criteria);

        //设置分组选项

        GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");

        query.setGroupOptions(groupOptions);
        //得到分组页
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //得到分组结果集
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        //得到分组结果入口页
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();
        //得到分组入口集合
        List<GroupEntry<TbItem>> content = groupEntries.getContent();

        for(GroupEntry<TbItem> entry:content){
            list.add(entry.getGroupValue());
        }
        return list;
    }

    private Map searchBrandAndSpecList(String category){
        Map map=new HashMap();

        Long typeId = (Long) redisTemplate.boundHashOps("itemCat").get(category);//获取模板 ID
        if(typeId!=null){

            //根据模板 ID 查询品牌列表
            List brandList = (List)redisTemplate.boundHashOps("brandList").get(typeId);

            map.put("brandList", brandList);//返回值添加品牌列表
            //根据模板 ID 查询规格列表
            List specList = (List)redisTemplate.boundHashOps("specList").get(typeId);
            map.put("specList", specList);

        }
        return map;
    }


}
