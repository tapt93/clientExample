import { Row, Col, Input, Button, Pagination } from "antd";
import FacebookTokenListTable from "./MainTable/FacebookTokenListTable";
import FacebookTokenDialog from "../Dialog/FacebookTokenDialog";
import React from "react";
import  FacebookTokenApi  from "../../../services/FacebookTokenApi";
import { Notification } from "../../../services/Notification";
import { withLoading } from "../../../common/HOC/WithLoading";
import ListBaseComponent from "../../../common/ListBaseComponent";
import  PageName  from "../../../common/CommonComponents/PageName"

export class FacebookTokenList extends ListBaseComponent {
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
    FacebookTokenDialog: {
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
    FacebookTokenApi.list(filter).then(res => {
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
    let dialog = { ...this.state.FacebookTokenDialog };
    dialog.show = true;
    dialog.isEdit = isEdit;
    dialog.id = id;
    this.setState({ FacebookTokenDialog: dialog });
  };

  _CloseAddDialog = (callBack = false) => {
    let dialog = { ...this.state.FacebookTokenDialog };
    dialog.show = false;
    dialog.isEdit = false;
    dialog.id = 0;
    this.setState({ FacebookTokenDialog: dialog });
    if (callBack) {
      setTimeout(() => {
        this.onSearch();
      }, 100);
    }
  };

  onDeleteItem = id => {
    FacebookTokenApi.delete(id).then(res => {
      if (res && res.status === 200) {
        this.Notification.success("Xóa thành công");
        this.onSearch();
      }
    });
  };
  render() {
    return (
      <>        
		<PageName text='FacebookToken' />
        <div className="page-content">
          <div className="search-div">
            <Row gutter={16}>
              <Col span={6} sm={12} md={6} xs={24}>
                <Input
                  placeholder="FacebookToken name"
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
            <FacebookTokenListTable
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

        {this.state.FacebookTokenDialog.show ? (
          <FacebookTokenDialog
            onCloseDialog={this._CloseAddDialog}
            {...this.state.FacebookTokenDialog}
          />
        ) : null}
      </>
    );
  }
}

export default withLoading(FacebookTokenList);
