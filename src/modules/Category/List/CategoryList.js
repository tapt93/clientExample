import { Row, Col, Input, Button, Pagination } from "antd";
import CategoryListTable from "./MainTable/CategoryListTable";
import CategoryDialog from "../Dialog/CategoryDialog";
import React from "react";
import  CategoryApi  from "../../../services/CategoryApi";
import { Notification } from "../../../services/Notification";
import { withLoading } from "../../../common/HOC/WithLoading";
import ListBaseComponent from "../../../common/ListBaseComponent";
import  PageName  from "../../../common/CommonComponents/PageName"

export class CategoryList extends ListBaseComponent {
  constructor(props) {
    super(props);
    this.Notification = new Notification();
    this.searchRef = React.createRef();
  }

  state = {
    data: [],
    filter: {
      paging: {
        pageSize: 15,
        currentPage: 1,
        rowsCount: 0
      }
    },
    CategoryDialog: {
      show: false,
      isEdit: false,
      id: 0
    }
  };
  componentDidMount() {
    this.onSearch();
  }

  onSearch = (currentPage = 1) => {
    this.props.showLoading();
    let filter = { ...this.state.filter };
    filter.paging.currentPage = currentPage;
    //filter.name = this.searchRef.current.input.value;
    CategoryApi.list(filter).then(res => {
      this.props.hideLoading();
      if (res && res.status === 200) {
        if (res.data) {
          let filter = { ...this.state.filter };
          filter.paging = res.data.paging;
          let data = res.data.list;
          let stt = res.data.paging.startRow;
          for (let item of data) {
            item.stt = stt;
            stt++;
          }
          this.setState({ data: res.data.list, filter: filter });
        }
      } else {
        if (res) {
          this.Notification.error(res.message);
        }
      }
    });
  };

  _OpenAddDialog = (isEdit = false, id = 0) => {
    let dialog = { ...this.state.CategoryDialog };
    dialog.show = true;
    dialog.isEdit = isEdit;
    dialog.id = id;
    this.setState({ CategoryDialog: dialog });
  };

  _CloseAddDialog = (callBack = false) => {
    let dialog = { ...this.state.CategoryDialog };
    dialog.show = false;
    dialog.isEdit = false;
    dialog.id = 0;
    this.setState({ CategoryDialog: dialog });
    if (callBack) {
      setTimeout(() => {
        this.onSearch();
      }, 100);
    }
  };

  onDeleteItem = id => {
    CategoryApi.delete(id).then(res => {
      if (res && res.status === 200) {
        this.Notification.success("Xóa thành công");
        this.onSearch();
      }
    });
  };
  render() {
    return (
      <>        
		<PageName text='Category' />
        <div className="page-content">
          <div className="search-div">
            <Row gutter={16}>
              <Col span={6} sm={12} md={6} xs={24}>
                <Input
                  placeholder="Category name"
                  onPressEnter={()=>this.onSearch(1)}
                  ref={this.searchRef}
                />
              </Col>
              <Col span={6} sm={12} md={6} xs={24}>
                <div className="btn-group-search">
                  <Button
                    icon="search"
                    loading={this.props.loading}
                    onClick={() => this.onSearch(1)}
                  >
                    Search
                  </Button>

                  <Button
                    type="primary"
                    icon="plus"
                    onClick={() => this._OpenAddDialog(false, 0)}
                  >
                    Add
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
          <div>
            <CategoryListTable
              data={this.state.data}
              onEditItem={this._OpenAddDialog}
              onDeleteItem={this.onDeleteItem}
            />
            <div className="page-div">
              <Pagination
                showSizeChanger
                onShowSizeChange={this.onShowSizeChange}
                showTotal={(total, range) => range[0] + ' - ' + range[1] + ' of ' + total + ' items'}                
                onChange={this.onPageChange}
                defaultCurrent={1}
                total={this.state.filter.paging.rowsCount}
				pageSizeOptions={['15', '20', '30', '40']}
                defaultPageSize={15}
              />
            </div>
          </div>
        </div>

        {this.state.CategoryDialog.show ? (
          <CategoryDialog
            onCloseDialog={this._CloseAddDialog}
            {...this.state.CategoryDialog}
          />
        ) : null}
      </>
    );
  }
}

export default withLoading(CategoryList);
